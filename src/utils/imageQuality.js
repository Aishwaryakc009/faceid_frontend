export function checkImageQuality(file) {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      URL.revokeObjectURL(url)

      const warnings = []
      const info = {}

      // Check resolution
      info.width = img.width
      info.height = img.height
      if (img.width < 100 || img.height < 100) {
        warnings.push('Image is too small. Use at least 100x100 pixels.')
      }

      // Check brightness
      let totalBrightness = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2]
        totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b)
      }
      const avgBrightness = totalBrightness / (data.length / 4)
      info.brightness = Math.round(avgBrightness)
      if (avgBrightness < 50) warnings.push('Image is too dark. Use better lighting.')
      if (avgBrightness > 220) warnings.push('Image is overexposed. Reduce lighting.')

      // Check blurriness (variance of grayscale)
      let mean = 0
      const grays = []
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
        grays.push(gray)
        mean += gray
      }
      mean /= grays.length
      let variance = 0
      for (const g of grays) variance += (g - mean) ** 2
      variance /= grays.length
      info.sharpness = Math.round(variance)
      if (variance < 100) warnings.push('Image appears blurry. Use a sharper photo.')

      resolve({ warnings, info, quality: warnings.length === 0 ? 'good' : 'warn' })
    }
    img.src = url
  })
}