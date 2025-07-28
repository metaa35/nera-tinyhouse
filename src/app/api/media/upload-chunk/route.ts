import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Cloudinary'ye yönlendir
    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/df770zzfr/video/upload', {
      method: 'POST',
      body: formData,
    })

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('Cloudinary chunk upload error:', errorText)
      return NextResponse.json(
        { error: `Cloudinary chunk upload failed: ${cloudinaryResponse.status}` },
        { status: cloudinaryResponse.status }
      )
    }

    const result = await cloudinaryResponse.json()
    
    return NextResponse.json({
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type
    })

  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Chunk upload hatası' },
      { status: 500 }
    )
  }
} 