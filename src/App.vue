<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { connectDevice, getAdb, requestDevice } from './utils/device';
import type { Adb, AdbSync } from '@yume-chan/adb';
import path from 'path-browserify';
import { IconCardboards, IconMusic } from '@tabler/icons-vue';
import { AdbDaemonWebUsbDevice } from '@yume-chan/adb-daemon-webusb';

const CUSTOM_SONG_LOCATION = "storage/emulated/0/Android/data/com.xrgames.beatable/files/CustomSongs"

const currentDeviceInfo = ref()
const deviceConnected = ref(false)
const uploadingSong = ref(false)
const uploadingName = ref("")
const connectionState = ref("")
const installedCharts: Ref<IChartFile[]> = ref([])
let adb: Adb
let sync: AdbSync

interface IChartFile {
  filePath: string
  fileName: string
}

const readChartsInDevice = async () => {
  installedCharts.value = []
  const customSongs = await sync.readdir(CUSTOM_SONG_LOCATION)

  for (const song of customSongs) {
    if (song.name.endsWith(".beats")) {
      installedCharts.value.push({
        fileName: song.name,
        filePath: path.join(CUSTOM_SONG_LOCATION, song.name)
      })
    }
  }
}

const openDevice = async () => {
  const device = await requestDevice()
  if (device) {
    console.log(device)
    currentDeviceInfo.value = device.raw
    if (device.raw.manufacturerName != "Oculus") {
      alert("Connected device is not Meta Quest")
      return
    }
    try {
      connectionState.value = "connecting"
      console.log("Connecting...")
      const connection = await connectDevice(device)
      connectionState.value = "authenticating"
      console.log("Authenticating...")
      adb = await getAdb(device, connection)

      if (adb) {
        console.log(adb)
        sync = await adb.sync();

        console.log(sync)
        const appFiles = await sync.readdir("storage/emulated/0/Android/data/")
        console.log(appFiles)
        const beatableInstalled = appFiles.find((e) => e.name == "com.xrgames.beatable") != undefined
        connectionState.value = ""

        if (beatableInstalled) {
          console.log("Beatable installed")
          readChartsInDevice()
          deviceConnected.value = true
        } else {
          alert("Beatable is not installed")
        }
        //const lsData = await runCmd("cd storage/emulated/0/Android/data/ && ls -1")
        //console.log(lsData)
      }
    } catch (err) {
      if (err instanceof AdbDaemonWebUsbDevice.DeviceBusyError) {
        alert(
          "The device is already in use by another program. (If you have adb.exe installed, please kill the process first)",
        );
      } else {
        alert(err)
      }

      connectionState.value = ""
    }
  }
}

const installChart = async (event: any) => {
  uploadingSong.value = true
  for (const file of event.target.files) {
    console.log("Uploading ", file.name)
    console.log(file)
    uploadingName.value = file.name

    await sync.write({
      filename: path.join(CUSTOM_SONG_LOCATION, file.name),
      file: file.stream()
    })
  }
  uploadingSong.value = false
  readChartsInDevice()
}

const deleteFile = async (chartFileData: IChartFile) => {
  await adb.rm(chartFileData.filePath)
  console.log(chartFileData.fileName, " Deleted")
  readChartsInDevice()
}
</script>

<template>
  <div class="container">
    <div class="banner">
      <h1>BEATABLE Soundtrack Manager</h1>
      <p>Manage your BEATABLE soundtracks, on the web</p>
    </div>
    <main>
      <div>
        <div v-if="deviceConnected" class="d-flex align-items-center">
          <IconCardboards size="48" stroke-width="1" />
          <div class="ms-2">
            <p class="text-muted m-0">Connected Device</p>
            <h3 class="m-0">{{ currentDeviceInfo.productName }}</h3>
          </div>
        </div>
      </div>
      <div v-if="!deviceConnected">
        <h3>Connect your device</h3>
        <p>Connect your Quest to your computer, then click 'Select Device' and choose your Quest from the list.</p>
        <button class="btn btn-light" @click="openDevice">Select Device</button>
      </div>
      <div class="alert alert-info mt-2" role="alert" v-if="connectionState == 'connecting'">
        <p>Connecting via USB...</p>
      </div>
      <div class="alert alert-info mt-2" role="alert" v-if="connectionState == 'authenticating'">
        <p>Put on your headset then press "Allow" to continue</p>
      </div>
    </main>

    <div v-if="deviceConnected">
      <hr>
      <h3>Installed Soundtracks</h3>

      <div class="card soundtrack-card mb-1" v-for="f in installedCharts">
        <div class="card-body">
          <p>
            <IconMusic class="me-1" stroke-width="1.5" /> {{ f.fileName }}
          </p> <button class="btn btn-danger" @click="deleteFile(f)">Delete</button>
        </div>
      </div>

      <p class="text-muted" v-if="installedCharts.length == 0">No custom songs installed -w-</p>

      <hr>

      <h3>Upload Soundtrack to Device</h3>

      <input v-if="!uploadingSong" class="form-control" type="file" multiple @change="installChart" accept=".beats" />
      <div v-if="uploadingSong" class="d-flex align-items-center mt-2">
        <div class="spinner-border text-light me-2" role="status"></div>
        <p>Uploading {{ uploadingName }}</p>
      </div>
    </div>

    <div>
      <hr>
      <p class="text-muted m-0">Make sure that you have BEATABLE installed and have launched it once before using this
        tool.</p>
      <p class="text-muted">This tool is not affiliated with XR Games</p>
      <p class="m-0">Made by <a href="https://himaji.xyz/" target="_blank">himaji!</a></p>
      <p class="m-0"><a href="https://github.com/maji-git/beatable-soundtrack-manager" target="_blank">Source code</a>
      </p>
    </div>
  </div>
</template>

<style scoped></style>
