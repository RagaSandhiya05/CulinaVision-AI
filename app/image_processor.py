import io 
import os 
import uuid 

from PIL import Image, ImageOps, UnidentifiedImageError 


class ImageProcessor: 

    MAX_FILE_SIZE = 10 * 1024 * 1024 

    MAX_IMAGE_SIZE = (1280, 1280) 

    ALLOWED_FORMATS = { 
        "JPEG", 
        "PNG", 
        "WEBP" 
    } 

    @staticmethod 
    def validate_file_size(file_bytes): 

        if len(file_bytes) > ImageProcessor.MAX_FILE_SIZE: 

            raise ValueError( 
                "Image size exceeds the 10 MB limit." 
            ) 


    @staticmethod 
    def validate_image(file_bytes): 

        try: 

            image = Image.open( 
                io.BytesIO(file_bytes) 
            ) 

            image.verify() 

        except ( 
            UnidentifiedImageError, 
            OSError 
        ): 

            raise ValueError( 
                "The uploaded file is not a valid image." 
            ) 


        image = Image.open( 
            io.BytesIO(file_bytes) 
        ) 


        if image.format not in ImageProcessor.ALLOWED_FORMATS: 

            raise ValueError( 
                "Unsupported image format. " 
                "Please upload JPG, JPEG, PNG, or WEBP." 
            ) 

        return image 

    @staticmethod 
    def process_image( 
        file_bytes, 
        upload_directory 
    ): 


        ImageProcessor.validate_file_size( 
            file_bytes 
        ) 


        image = ImageProcessor.validate_image( 
            file_bytes 
        ) 


        image = ImageOps.exif_transpose( 
            image 
        ) 


        image.thumbnail( 
            ImageProcessor.MAX_IMAGE_SIZE, 
            Image.Resampling.LANCZOS 
        ) 


        if image.mode != "RGB": 

            if image.mode in ( 
                "RGBA", 
                "LA" 
            ): 

                background = Image.new( 
                    "RGB", 
                    image.size, 
                    "white" 
                ) 

                background.paste( 
                    image, 
                    mask=image.getchannel("A") 
                ) 

                image = background 

            else: 

                image = image.convert("RGB") 


        filename = ( 
            f"{uuid.uuid4().hex}.jpg" 
        ) 


        os.makedirs( 
            upload_directory, 
            exist_ok=True 
        ) 


        output_path = os.path.join( 
            upload_directory, 
            filename 
        ) 


        image.save( 
            output_path, 
            format="JPEG", 
            quality=90, 
            optimize=True 
        ) 


        return output_path
