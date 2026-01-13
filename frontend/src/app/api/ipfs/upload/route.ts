import { NextRequest, NextResponse } from "next/server";

// Ensure Node.js runtime to use Buffer for base64 decoding
export const runtime = "nodejs";

function parseDataUrl(dataUrl: string): { mimeType: string; buffer: Buffer } {
  const match = dataUrl.match(/^data:(.+);base64,(.*)$/);
  if (!match) {
    throw new Error("Invalid data URL format");
  }
  const mimeType = match[1];
  const base64Data = match[2];
  const buffer = Buffer.from(base64Data, "base64");
  return { mimeType, buffer };
}

export async function POST(request: NextRequest) {
  try {
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!pinataJwt) {
      return NextResponse.json(
        { message: "PINATA_JWT is not configured" },
        { status: 500 }
      );
    }

    const contentType = request.headers.get("content-type") || "";

    let file: File | Blob | null = null;
    let name: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const uploaded = form.get("file");
      const formName = form.get("name");
      if (!(uploaded instanceof File)) {
        return NextResponse.json({ message: "Missing file" }, { status: 400 });
      }
      file = uploaded;
      name = typeof formName === "string" ? formName : undefined;
    } else {
      const body = await request.json();
      const dataUrl: string | undefined = body?.imageDataUrl;
      name = body?.name;
      if (!dataUrl || typeof dataUrl !== "string") {
        return NextResponse.json({ message: "imageDataUrl required" }, { status: 400 });
      }
      const { mimeType, buffer } = parseDataUrl(dataUrl);
      const uint8 = new Uint8Array(buffer);                    // copies the data
      file = new Blob([uint8], { type: mimeType });
    }

    // Build multipart/form-data payload for Pinata
    const formData = new FormData();
    formData.append("file", file);

    if (name) {
      const metadata = { name };
      formData.append("pinataMetadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    }

    const pinRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pinataJwt}`,
      },
      body: formData,
    });

    if (!pinRes.ok) {
      const text = await pinRes.text();
      return NextResponse.json(
        { message: `Pinata upload failed: ${text}` },
        { status: 500 }
      );
    }

    const data = await pinRes.json();
    const cid: string = data?.IpfsHash;
    if (!cid) {
      return NextResponse.json(
        { message: "Pinata response missing IpfsHash" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        cid,
        url: `ipfs://${cid}`,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("IPFS upload error:", err);
    return NextResponse.json({ message: err?.message ?? "Upload failed" }, { status: 500 });
  }
}