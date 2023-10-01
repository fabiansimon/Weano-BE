import Ffmpeg from "fluent-ffmpeg"
import fs from 'fs'
import mongoose from "mongoose"
import fetch from "node-fetch"
import path from "path"
import sharp from "sharp"

const VIDEO_OPTIONS = {
    framerate: 1, 
    durationPerImage: 6,
}

export async function generateVideo(tripId) {
    const IMAGE_DIRECTORY = `temp/trip_raw_images_${tripId}`
    const OUTPUT_FILE = `temp/custom_video_diary_${tripId}.mp4`;

    try {
        const rawImages = await fetchImageData(tripId);
        await downloadImages(rawImages, IMAGE_DIRECTORY);
        await generateFFSlideshow(IMAGE_DIRECTORY, OUTPUT_FILE);
        return OUTPUT_FILE;
    } catch (error) {
        console.error(error);
    }
}

async function fetchImageData(tripId) {
    const db = mongoose.connection;

    const Trips = db.model('trip');
    const Images = db.model('image');

    const { images } = await Trips.findById(tripId);

    return await Images.find({
        _id: {
          $in: images,
        },
    });
}

async function downloadImages(images, dir) {
    if (fs.existsSync(dir)) {
        fs.rmdirSync(dir, {recursive: true});
    }
    
    fs.mkdirSync(dir);
    const promises = images.map(async ({uri}, index) => {
        const res = await fetch(uri).catch((e) => console.error(e.message));
        const imageBuffer = await sharp(await res.arrayBuffer())
            .resize(1080, 1920)
            .toBuffer();
        const filePath = path.join(dir, `image${index + 1}.jpg`);
        fs.writeFileSync(filePath, imageBuffer);
        return filePath;
    })

    return Promise.all(promises);
}

async function generateFFSlideshow(dir, out) {
    const ff = Ffmpeg();
    
    const imagePattern = `${dir}/image%d.jpg`;

    ff.input(imagePattern)
        .inputFormat("image2")
        .inputOptions(`-framerate ${VIDEO_OPTIONS.framerate}`)
        .inputOptions(`-t ${VIDEO_OPTIONS.durationPerImage}`)
        .inputOptions("-start_number 1")

    ff.outputOptions([
        '-c:v libx264',  // Video codec
        '-pix_fmt yuv420p',  // Pixel format (required for compatibility)
    ]);

    ff.output(out);

    if (fs.existsSync(out)) {
        fs.rmSync(out, {recursive: true});
    }

    ff.on('end', () => {
        console.log('Slideshow generation finished.');
        fs.rmdirSync(dir, {recursive: true});
    })
    .on('error', (err) => {
        console.error('Error:', err);
    })
    .run();
}
