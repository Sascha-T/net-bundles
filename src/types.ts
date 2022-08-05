// https://gist.github.com/Sascha-T/c5f217aa0804679b7281aa986e53004e##types
export const SIGNATURE = [
    0x8b, 0x12, 0x02, 0xb9, 0x6a, 0x61, 0x20, 0x38,
    0x72, 0x7b, 0x93, 0x02, 0x14, 0xd7, 0xa0, 0x32,
    0x13, 0xf5, 0xb9, 0xe6, 0xef, 0xae, 0x33, 0x18,
    0xee, 0x3b, 0x2d, 0xce, 0x24, 0xb3, 0x6a, 0xae
    // SHA256 for ".net core bundle"
]
export interface BundleHeader {
    MajorVersion: number,
    MinorVersion: number,
    EmbeddedFileCount: number,
    BundleID: string,
    DepsJsonOffset: number,
    DepsJsonSize: number,
    RuntimeJsonOffset: number,
    RuntimeJsonSize: number,
    Flags: number
    Files: FileEntry[]
}
export interface FileEntry {
    Offset: number,
    Size: number,
    CompressedSize: number,
    Type: FileType,
    Name: string
}
export enum FileType {
    Unknown = 0x00,
    NetAssemblies = 0x01,
    NativeBinaries = 0x02,
    DepsJson = 0x03,
    RuntimeConfigJson = 0x04,
    DebugSymbols = 0x05
}
