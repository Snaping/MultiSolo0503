package com.example.motionvideocreator.service

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Environment
import com.arthenica.mobileffmpeg.Config
import com.arthenica.mobileffmpeg.FFmpeg
import com.example.motionvideocreator.data.FestivalItem
import com.example.motionvideocreator.data.ThemeItem
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class VideoGeneratorService(private val context: Context) {

    fun generateVideo(
        imagePath: String,
        festival: FestivalItem,
        theme: ThemeItem,
        prompt: String,
        callback: (String?, String?) -> Unit
    ) {
        Thread {
            try {
                val outputPath = createVideoWithEffects(imagePath, festival, theme, prompt)
                callback(outputPath, null)
            } catch (e: Exception) {
                callback(null, e.message)
            }
        }.start()
    }

    private fun createVideoWithEffects(
        imagePath: String,
        festival: FestivalItem,
        theme: ThemeItem,
        prompt: String
    ): String {
        val framesDir = File(context.cacheDir, "video_frames")
        framesDir.mkdirs()

        val bitmap = BitmapFactory.decodeFile(imagePath)
        val frameCount = 60
        val durationMs = 3000

        for (i in 0 until frameCount) {
            val progress = i.toFloat() / frameCount
            val frameBitmap = applyAnimation(bitmap, theme, progress)
            val textOverlay = createTextOverlay(prompt, festival, progress)
            
            val combinedBitmap = combineBitmaps(frameBitmap, textOverlay)
            val frameFile = File(framesDir, "frame_${String.format("%04d", i)}.png")
            combinedBitmap.compress(Bitmap.CompressFormat.PNG, 100, FileOutputStream(frameFile))
            combinedBitmap.recycle()
            frameBitmap.recycle()
            textOverlay.recycle()
        }
        bitmap.recycle()

        val outputFile = createOutputFile()
        val ffmpegCommand = buildFfmpegCommand(framesDir, outputFile, durationMs)
        
        val rc = FFmpeg.execute(ffmpegCommand)
        if (rc != Config.RETURN_CODE_SUCCESS) {
            throw IOException("FFmpeg execution failed with rc=$rc")
        }

        deleteDirectory(framesDir)
        return outputFile.absolutePath
    }

    private fun applyAnimation(bitmap: Bitmap, theme: ThemeItem, progress: Float): Bitmap {
        val width = bitmap.width
        val height = bitmap.height
        val animatedBitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(animatedBitmap)

        when (theme.animationType) {
            com.example.motionvideocreator.data.AnimationType.FADE_IN -> {
                canvas.drawBitmap(bitmap, 0f, 0f, null)
                val paint = Paint()
                paint.alpha = ((1 - progress) * 255).toInt()
                paint.color = Color.BLACK
                canvas.drawRect(0f, 0f, width.toFloat(), height.toFloat(), paint)
            }
            com.example.motionvideocreator.data.AnimationType.SLIDE_UP -> {
                val translateY = height * (1 - progress)
                canvas.drawBitmap(bitmap, 0f, translateY, null)
            }
            com.example.motionvideocreator.data.AnimationType.ZOOM_IN -> {
                val scale = 1 + progress * 0.2f
                val centerX = width / 2f
                val centerY = height / 2f
                canvas.save()
                canvas.scale(scale, scale, centerX, centerY)
                canvas.drawBitmap(bitmap, 0f, 0f, null)
                canvas.restore()
            }
            com.example.motionvideocreator.data.AnimationType.ROTATE -> {
                val rotation = progress * 360f
                val centerX = width / 2f
                val centerY = height / 2f
                canvas.save()
                canvas.rotate(rotation, centerX, centerY)
                canvas.drawBitmap(bitmap, 0f, 0f, null)
                canvas.restore()
            }
            com.example.motionvideocreator.data.AnimationType.WAVE -> {
                val waveOffset = Math.sin(progress * Math.PI * 4) * 20
                canvas.drawBitmap(bitmap, 0f, waveOffset.toFloat(), null)
            }
            else -> {
                canvas.drawBitmap(bitmap, 0f, 0f, null)
            }
        }

        return animatedBitmap
    }

    private fun createTextOverlay(prompt: String, festival: FestivalItem, progress: Float): Bitmap {
        val width = 1080
        val height = 300
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        canvas.drawColor(Color.TRANSPARENT)

        val festivalPaint = Paint().apply {
            textSize = 48f
            color = Color.WHITE
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
            shadowLayer = 10f
        }

        val promptPaint = Paint().apply {
            textSize = 32f
            color = Color.WHITE
            textAlign = Paint.Align.CENTER
            isAntiAlias = true
            shadowLayer = 8f
        }

        val alpha = (progress * 255).toInt()
        festivalPaint.alpha = alpha
        promptPaint.alpha = alpha

        canvas.drawText("${festival.icon} ${festival.name}", width / 2f, 80f, festivalPaint)
        canvas.drawText(prompt, width / 2f, 180f, promptPaint)

        return bitmap
    }

    private fun combineBitmaps(base: Bitmap, overlay: Bitmap): Bitmap {
        val result = Bitmap.createBitmap(base.width, base.height, base.config)
        val canvas = Canvas(result)
        canvas.drawBitmap(base, 0f, 0f, null)
        
        val overlayY = base.height - overlay.height.toFloat()
        canvas.drawBitmap(overlay, 0f, overlayY, null)
        
        return result
    }

    private fun buildFfmpegCommand(framesDir: File, outputFile: File, durationMs: Int): String {
        val fps = 20
        val framePattern = "${framesDir.absolutePath}/frame_%04d.png"
        val bitrate = "5000k"
        
        return "-framerate $fps -i $framePattern -c:v libx264 -r $fps -b:v $bitrate -pix_fmt yuv420p -y ${outputFile.absolutePath}"
    }

    private fun createOutputFile(): File {
        val mediaDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
        val appDir = File(mediaDir, "MotionVideoCreator")
        appDir.mkdirs()

        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        return File(appDir, "video_$timeStamp.mp4")
    }

    private fun deleteDirectory(dir: File) {
        if (dir.isDirectory) {
            dir.listFiles()?.forEach { deleteDirectory(it) }
        }
        dir.delete()
    }

    fun getVideoDuration(videoPath: String): Long {
        val retriever = MediaMetadataRetriever()
        return try {
            retriever.setDataSource(videoPath)
            val durationStr = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
            durationStr?.toLong() ?: 0L
        } finally {
            retriever.release()
        }
    }
}