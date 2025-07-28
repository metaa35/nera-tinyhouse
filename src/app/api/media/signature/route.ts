import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: Request) {
  try {
    const params = await request.json()
    
    // Cloudinary API key'i de ekle
    const uploadParams = {
      ...params,
      api_key: process.env.CLOUDINARY_API_KEY
    }
    
    const signature = cloudinary.utils.api_sign_request(
      uploadParams,
      process.env.CLOUDINARY_API_SECRET!
    )

    console.log('Signature created for params:', uploadParams)
    console.log('Signature:', signature)

    return NextResponse.json({
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/${params.resource_type}/upload`
    })

  } catch (error) {
    console.error('Signature oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Signature oluşturulamadı' }, 
      { status: 500 }
    )
  }
} 