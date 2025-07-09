use anyhow::{Result, anyhow};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use reqwest::header::{HeaderMap, HeaderName, HeaderValue};

pub struct UploadService {
    client: Client,
    bundlr_url: String,
}

impl UploadService {
    pub fn new() -> Result<Self> {
        let bundlr_url = std::env::var("BUNDLR_URL")
            .unwrap_or_else(|_| "https://node1.bundlr.network".to_string());

        Ok(Self {
            client: Client::new(),
            bundlr_url,
        })
    }

    pub async fn upload_image(&self, image_data: &[u8], filename: &str) -> Result<String> {
        // Тут буде логіка завантаження зображення на Arweave через Bundlr
        // Поки що повертаємо заглушку
        
        log::info!("Uploading image: {} ({} bytes)", filename, image_data.len());
        
        // Симулюємо завантаження
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        // Повертаємо заглушку URI
        let image_uri = format!("https://arweave.net/mock-image-{}", filename);
        
        log::info!("Image uploaded successfully: {}", image_uri);
        
        Ok(image_uri)
    }

    pub async fn upload_metadata<T: Serialize>(&self, metadata: &T) -> Result<String> {
        // Тут буде логіка завантаження metadata на Arweave через Bundlr
        // Поки що повертаємо заглушку
        
        let metadata_json = serde_json::to_string(metadata)?;
        log::info!("Uploading metadata: {} bytes", metadata_json.len());
        
        // Симулюємо завантаження
        tokio::time::sleep(tokio::time::Duration::from_millis(100)).await;
        
        // Повертаємо заглушку URI
        let metadata_uri = "https://arweave.net/mock-metadata-json".to_string();
        
        log::info!("Metadata uploaded successfully: {}", metadata_uri);
        
        Ok(metadata_uri)
    }

    pub async fn upload_to_bundlr(&self, data: &[u8], content_type: &str) -> Result<String> {
        // Реальна реалізація завантаження на Bundlr
        let url = format!("{}/tx", self.bundlr_url);
        
        let mut headers = HeaderMap::new();
        headers.insert(HeaderName::from_static("content-type"), HeaderValue::from_str(content_type)?);
        
        let response = self.client
            .post(&url)
            .headers(headers)
            .body(data.to_vec())
            .send()
            .await?;

        if response.status().is_success() {
            let response_text = response.text().await?;
            // Bundlr повертає ID транзакції, який можна використовувати для отримання URI
            Ok(format!("https://arweave.net/{}", response_text))
        } else {
            Err(anyhow!("Failed to upload to Bundlr: {}", response.status()))
        }
    }

    pub async fn get_file_info(&self, uri: &str) -> Result<FileInfo> {
        // Отримуємо інформацію про файл з Arweave
        let response = self.client.get(uri).send().await?;
        
        if response.status().is_success() {
            let content_type = response
                .headers()
                .get("content-type")
                .and_then(|h| h.to_str().ok())
                .unwrap_or("application/octet-stream")
                .to_string();
            
            let content_length = response
                .headers()
                .get("content-length")
                .and_then(|h| h.to_str().ok())
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(0);
            
            Ok(FileInfo {
                uri: uri.to_string(),
                content_type,
                content_length,
                available: true,
            })
        } else {
            Ok(FileInfo {
                uri: uri.to_string(),
                content_type: "".to_string(),
                content_length: 0,
                available: false,
            })
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub uri: String,
    pub content_type: String,
    pub content_length: u64,
    pub available: bool,
}

impl UploadService {
    pub async fn validate_image(&self, image_data: &[u8]) -> Result<()> {
        // Перевіряємо, чи це дійсне зображення
        if image_data.len() == 0 {
            return Err(anyhow!("Image data is empty"));
        }
        
        // Перевіряємо заголовки файлу для визначення типу зображення
        if image_data.len() >= 8 {
            let header = &image_data[0..8];
            
            // PNG
            if header.starts_with(&[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]) {
                return Ok(());
            }
            
            // JPEG
            if header.starts_with(&[0xFF, 0xD8, 0xFF]) {
                return Ok(());
            }
            
            // GIF
            if header.starts_with(b"GIF87a") || header.starts_with(b"GIF89a") {
                return Ok(());
            }
            
            // WebP
            if header.starts_with(b"RIFF") && &header[8..12] == b"WEBP" {
                return Ok(());
            }
        }
        
        Err(anyhow!("Unsupported image format"))
    }

    pub fn get_file_extension<'a>(&self, filename: &'a str) -> Option<&'a str> {
        filename.split('.').last()
    }

    pub fn get_content_type(&self, filename: &str) -> &str {
        match self.get_file_extension(filename) {
            Some("png") => "image/png",
            Some("jpg") | Some("jpeg") => "image/jpeg",
            Some("gif") => "image/gif",
            Some("webp") => "image/webp",
            Some("svg") => "image/svg+xml",
            _ => "application/octet-stream",
        }
    }
} 