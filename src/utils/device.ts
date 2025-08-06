import AdbWebCredentialStore from "@yume-chan/adb-credential-web";
import { AdbDaemonWebUsbConnection, AdbDaemonWebUsbDevice, AdbDaemonWebUsbDeviceManager } from "@yume-chan/adb-daemon-webusb";
import { Adb, AdbDaemonTransport } from "@yume-chan/adb";

const Manager: AdbDaemonWebUsbDeviceManager | undefined = AdbDaemonWebUsbDeviceManager.BROWSER;
const CredentialStore: AdbWebCredentialStore = new AdbWebCredentialStore("BeatableWebInstaller");

export async function requestDevice() {
    if (!Manager) {
        alert("Error: No ADB Interface (Your device may be unsupported)")
        return
    }
    const device: AdbDaemonWebUsbDevice | undefined = await Manager.requestDevice();
    return device
}

export async function connectDevice(device: AdbDaemonWebUsbDevice) {
    try {
        return await device.connect();
    } catch (error) {
        throw error;
    }

}
export async function getAdb(device: AdbDaemonWebUsbDevice, connection: AdbDaemonWebUsbConnection) {
    const transport = await AdbDaemonTransport.authenticate({
        serial: device.serial,
        connection,
        credentialStore: CredentialStore,
    });

    return new Adb(transport);
}