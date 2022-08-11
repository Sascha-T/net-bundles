import {BundleHeader, FileEntry, SIGNATURE} from "./types";

namespace Header {
    export function findHeaderOffset(file: ArrayBuffer): number {
        let uint8 = new Uint8Array(file)
        let sigIdx = 0;
        let offset = 0;
        for (offset = 0; offset < file.byteLength; offset++) {
            if(uint8[offset] == SIGNATURE[sigIdx])
                sigIdx++;
            else
                sigIdx = 0;
            if(sigIdx == SIGNATURE.length)
                break
        }
        if(sigIdx == null)
            throw "Not a bundle file."
        let arr = new DataView(file, offset - SIGNATURE.length - 7);
        return Number(arr.getBigUint64(0, true));
    }
    export function readFileEntry(file: ArrayBuffer, offset: number): [number, FileEntry] {
        let dataview = new DataView(file, offset);
        let fileOffset = Number(dataview.getBigUint64(0x00, true))
        let fileSize = Number(dataview.getBigUint64(0x08, true))
        let compressedSize = Number(dataview.getBigUint64(0x10, true))
        let type = dataview.getUint8(0x18);
        let nameSize = dataview.getUint8(0x19);
        let name = "";
        for (let i = 0; i < nameSize; i++) {
            name += String.fromCharCode(dataview.getUint8(0x1a + i));
        }
        return [
            offset + 0x1a + nameSize,
            {
                Offset: fileOffset,
                Size: fileSize,
                CompressedSize: compressedSize,
                Type: type,
                Name: name
            }
        ]
    }
}

export function readBundleHeader(file: ArrayBuffer): BundleHeader {
    let offset = Header.findHeaderOffset(file);
    let dataview = new DataView(file, offset);
    let majorVersion = dataview.getUint32(0x00, true);
    let minorVersion = dataview.getUint32(0x04, true);
    let fileCount = dataview.getUint32(0x08, true);
    let bundleIDSize = dataview.getUint8(0x0C);
    let bundleID = ""
    for (let i = 0; i < bundleIDSize; i++) {
        bundleID += String.fromCharCode(dataview.getUint8(0x0D + i));
    }
    let depsJsonOffset = Number(dataview.getBigUint64(0x0D + bundleIDSize, true));
    let depsJsonSize = Number(dataview.getBigUint64(0x15 + bundleIDSize, true));
    let runtJsonOffset = Number(dataview.getBigUint64(0x1D + bundleIDSize, true));
    let runtJsonSize = Number(dataview.getBigUint64(0x25 + bundleIDSize, true));
    let flags = Number(dataview.getBigUint64(0x2D + bundleIDSize, true));
    let files = []
    let last = offset + 0x35 + bundleIDSize
    for (let i = 0; i < fileCount; i++) {
        let read = Header.readFileEntry(file, last)
        last = read[0];
        files.push(read[1])
    }
    return {
        BundleID: bundleID,
        DepsJsonOffset: depsJsonOffset,
        DepsJsonSize: depsJsonSize,
        EmbeddedFileCount: fileCount,
        Files: files,
        Flags: flags,
        MajorVersion: majorVersion,
        MinorVersion: minorVersion,
        RuntimeJsonOffset: runtJsonOffset,
        RuntimeJsonSize: runtJsonSize
    }
}

export function readFile(file: ArrayBuffer, entry: FileEntry, inflateRawSync?: any): ArrayBuffer {
    let decomp = entry.CompressedSize != 0
    let size = decomp ? entry.CompressedSize : entry.Size
    let data = new ArrayBuffer(size);

    let from = new Uint8Array(file);
    let to = new Uint8Array(data);
    for (let i = entry.Offset; i < entry.Offset + size; i++)
        to[i - entry.Offset] = from[i]
    if(decomp)
        to = inflateRawSync(to);
    return to.buffer;
}
