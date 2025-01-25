# Ventoro

Developing something innovative

## `.env` file content

PORT=5000

NODE_ENV=development

MONGO_URI=<your mongodb connection string>

SECRET_KEY=<enter any text>

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLOUDINARY_API_ENVIORNMENT_URL=your_cloudinary_api_env

GOOGLE_CLIENT_ID=your_google_OAuth_client_id

GOOGLE_CLIENT_SECRET=your_google_OAuth_client_secret

process.env.GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
