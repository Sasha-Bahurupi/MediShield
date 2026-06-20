package com.example.backend.service;

import com.google.zxing.BinaryBitmap;
import com.google.zxing.MultiFormatReader;
import com.google.zxing.Result;
import com.google.zxing.client.j2se.BufferedImageLuminanceSource;
import com.google.zxing.common.HybridBinarizer;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.Base64;

@Service
public class QRCodeService {

    public String decodeQRCodeFromBase64(String base64Image) {
        try {
            if (base64Image == null || base64Image.trim().isEmpty()) {
                return null;
            }
            
            // Remove data URI prefix if present
            if (base64Image.contains(",")) {
                base64Image = base64Image.substring(base64Image.indexOf(",") + 1);
            }
            
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes);
            BufferedImage bufferedImage = ImageIO.read(bais);

            if (bufferedImage == null) {
                return null;
            }

            BufferedImageLuminanceSource source = new BufferedImageLuminanceSource(bufferedImage);
            BinaryBitmap bitmap = new BinaryBitmap(new HybridBinarizer(source));

            Result result = new MultiFormatReader().decode(bitmap);
            return result.getText();
        } catch (Exception e) {
            System.err.println("Failed to decode QR Code: " + e.getMessage());
            return null;
        }
    }
}
