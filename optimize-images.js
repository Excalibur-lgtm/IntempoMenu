const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './';
const outputDir = './optimized';

// Создаём папку для оптимизированных изображений
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Получаем список всех JPG файлов
const jpgFiles = fs.readdirSync(inputDir)
  .filter(file => /^page-\d{2}\.jpg$/.test(file));

console.log(`Найдено ${jpgFiles.length} изображений для оптимизации`);

// Оптимизируем каждое изображение
async function optimizeImages() {
  for (const file of jpgFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    try {
      await sharp(inputPath)
        .jpeg({ 
          quality: 75,        // Качество 75% - хороший баланс между размером и качеством
          progressive: true,  // Прогрессивная загрузка для лучшего UX
          mozjpeg: true       // Используем MozJPEG для лучшего сжатия
        })
        .resize({
          width: 1600,        // Максимальная ширина 1600px (достаточно для большинства экранов)
          height: 1200,       // Максимальная высота 1200px
          fit: 'inside',      // Сохраняем пропорции
          withoutEnlargement: true // Не увеличиваем маленькие изображения
        })
        .toFile(outputPath);
      
      const inputStats = fs.statSync(inputPath);
      const outputStats = fs.statSync(outputPath);
      const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
      
      console.log(`${file}: ${(inputStats.size / 1024).toFixed(0)}KB → ${(outputStats.size / 1024).toFixed(0)}KB (экономия ${savings}%)`);
    } catch (error) {
      console.error(`Ошибка при обработке ${file}:`, error.message);
    }
  }
  
  console.log('\nОптимизация завершена! Файлы сохранены в папку ./optimized');
}

optimizeImages();
