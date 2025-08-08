import { SmartBuffer } from 'smart-arraybuffer';

export class BeatableChartData {
    version: number = 0;
    audioBlobSize: number = 0;
    audioBuffer: ArrayBuffer = new ArrayBuffer();
    coverArt = {
        blobSize: 0,
        textureFormat: 0,
        width: 0,
        height: 0,
        data: new ArrayBuffer(),
    };
    songDetails = {
        id: '',
        songTitle: '',
        artist: '',
        totalLengthInSeconds: 0,
        audioStartOffset: 0
    };
}

export function readBeats(content: ArrayBuffer) {
    const reader = SmartBuffer.fromBuffer(content);
    if (reader.readBuffer(1).toString("hex") != "62") {
        return
    }
    const result = new BeatableChartData()

    result.version = reader.readInt32LE()
    result.audioBlobSize = reader.readInt32LE()
    if (result.audioBlobSize != 0) {
        result.audioBuffer = reader.readBuffer(result.audioBlobSize)
    }

    result.coverArt.blobSize = reader.readInt32LE()
    result.coverArt.textureFormat = reader.readInt32LE()
    result.coverArt.width = reader.readInt32LE()
    result.coverArt.height = reader.readInt32LE()
    result.coverArt.data = reader.readBuffer(result.coverArt.blobSize)

    const idLength = reader.readUInt8()
    result.songDetails.id = reader.readString(idLength)
    const songTitleLength = reader.readUInt8()
    result.songDetails.songTitle = reader.readString(songTitleLength)
    const artistLength = reader.readUInt8()
    result.songDetails.artist = reader.readString(artistLength)

    result.songDetails.totalLengthInSeconds = reader.readFloatLE()
    result.songDetails.audioStartOffset = reader.readUInt32LE()

    return result
}