package com.example.motionvideocreator

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.widget.Button
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.VideoView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import java.io.File

class VideoPreviewActivity : AppCompatActivity() {

    private lateinit var videoView: VideoView
    private lateinit var progressBar: ProgressBar
    private lateinit var playButton: ImageView
    private lateinit var btnSave: Button
    private lateinit var btnShare: Button

    private var videoPath: String? = null
    private var isPlaying = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_video_preview)

        setupViews()
        setupVideo()
        setupListeners()
    }

    private fun setupViews() {
        videoView = findViewById(R.id.video_view)
        progressBar = findViewById(R.id.progress_bar)
        playButton = findViewById(R.id.play_button)
        btnSave = findViewById(R.id.btn_save)
        btnShare = findViewById(R.id.btn_share)
    }

    private fun setupVideo() {
        videoPath = intent.getStringExtra("videoPath")
        videoPath?.let { path ->
            val uri = Uri.parse("file://$path")
            videoView.setVideoURI(uri)

            videoView.setOnPreparedListener {
                progressBar.visibility = View.GONE
                it.isLooping = true
            }

            videoView.setOnCompletionListener {
                isPlaying = false
                playButton.visibility = View.VISIBLE
            }
        }
    }

    private fun setupListeners() {
        playButton.setOnClickListener {
            if (isPlaying) {
                videoView.pause()
                playButton.visibility = View.VISIBLE
            } else {
                videoView.start()
                playButton.visibility = View.GONE
            }
            isPlaying = !isPlaying
        }

        videoView.setOnClickListener {
            if (isPlaying) {
                videoView.pause()
                playButton.visibility = View.VISIBLE
                isPlaying = false
            }
        }

        btnSave.setOnClickListener {
            saveVideo()
        }

        btnShare.setOnClickListener {
            shareVideo()
        }
    }

    private fun saveVideo() {
        videoPath?.let { path ->
            val sourceFile = File(path)
            val destDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MOVIES)
            val destFile = File(destDir, sourceFile.name)

            try {
                sourceFile.copyTo(destFile, overwrite = true)
                showSuccessDialog("视频已保存到相册")
            } catch (e: Exception) {
                showErrorDialog("保存失败: ${e.message}")
            }
        }
    }

    private fun shareVideo() {
        videoPath?.let { path ->
            val file = File(path)
            val uri = FileProvider.getUriForFile(
                this,
                "com.example.motionvideocreator.fileprovider",
                file
            )

            val shareIntent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_STREAM, uri)
                type = "video/mp4"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            startActivity(Intent.createChooser(shareIntent, "分享视频"))
        }
    }

    private fun showSuccessDialog(message: String) {
        MaterialAlertDialogBuilder(this)
            .setTitle("成功")
            .setMessage(message)
            .setPositiveButton("确定") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun showErrorDialog(message: String) {
        MaterialAlertDialogBuilder(this)
            .setTitle("错误")
            .setMessage(message)
            .setPositiveButton("确定") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    override fun onDestroy() {
        videoView.stopPlayback()
        super.onDestroy()
    }
}