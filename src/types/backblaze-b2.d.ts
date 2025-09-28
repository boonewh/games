// Local module shim for backblaze-b2 (no official types available)
declare module 'backblaze-b2' {
  interface BackblazeB2Options {
    applicationKeyId: string
    applicationKey: string
  }

  class BackblazeB2 {
    constructor(opts: BackblazeB2Options)
    authorize(): Promise<unknown>
    listFileNames(opts: { bucketId: string; maxFileCount?: number }): Promise<{ data: unknown }>
    getUploadUrl(opts: { bucketId: string }): Promise<{ data: { uploadUrl: string; authorizationToken: string } }>
    uploadFile(opts: { uploadUrl: string; uploadAuthToken: string; fileName: string; data: Buffer; contentType: string }): Promise<{ data: unknown }>
  }

  export default BackblazeB2
}
