<template>
  <v-app>
    <v-dialog persistent v-model="progress.visible">
      <v-card>
        <v-card-title class="headline">Progress</v-card-title>
        <v-card-text>
          <v-progress-linear
            stream
            color="accent"
            :buffer-value="progress.value"
            :value="progress.value"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-navigation-drawer temporary v-model="drawer" width="400">
      <v-list dense>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Plane</v-list-item-title>
            <v-list-item-action-text>
              <slider
                label="X"
                value="viewer.plane.X"
                v-model="viewer.plane.X"
              />
              <slider
                label="Y"
                value="viewer.plane.Y"
                v-model="viewer.plane.Y"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Position</v-list-item-title>
            <v-list-item-action-text>
              <slider
                label="X"
                :min="-20"
                :max="20"
                value="viewer.position.X"
                v-model="viewer.position.X"
              />
              <slider
                label="Y"
                :min="-20"
                :max="20"
                value="viewer.position.Y"
                v-model="viewer.position.Y"
              />
              <slider
                label="Z"
                :min="-20"
                :max="20"
                value="viewer.position.Z"
                v-model="viewer.position.Z"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Rotation</v-list-item-title>
            <v-list-item-action-text>
              <slider
                label="X"
                :min="-180"
                :max="180"
                value="viewer.rotation.X"
                v-model="viewer.rotation.X"
              />
              <slider
                label="Y"
                :min="-180"
                :max="180"
                value="viewer.rotation.Y"
                v-model="viewer.rotation.Y"
              />
              <slider
                label="Z"
                :min="-180"
                :max="180"
                value="viewer.rotation.Z"
                v-model="viewer.rotation.Z"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Scale</v-list-item-title>
            <v-list-item-action-text>
              <slider
                label="X"
                :min="0"
                :max="10"
                value="viewer.scale.X"
                v-model="viewer.scale.X"
              />
              <slider
                label="Y"
                :min="0"
                :max="10"
                value="viewer.scale.Y"
                v-model="viewer.scale.Y"
              />
              <slider
                label="Z"
                :min="0"
                :max="10"
                value="viewer.scale.Z"
                v-model="viewer.scale.Z"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>

        <v-list-item>
          <v-list-item-content>
            <v-list-item-title class="title">Theme</v-list-item-title>

            <v-list-item-action-text>
              <color-picker
                label="Background Color"
                v-model="viewer.theme.background"
              />
            </v-list-item-action-text>

            <v-list-item-action-text>
              <color-picker label="Plane Color" v-model="viewer.theme.plane" />
            </v-list-item-action-text>

            <v-list-item-action-text>
              <color-picker
                label="Primary Color"
                v-model="viewer.theme.primary"
              />
            </v-list-item-action-text>
            <v-list-item-action-text>
              <color-picker
                label="Secondary Color"
                v-model="viewer.theme.secondary"
              />
            </v-list-item-action-text>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-btn icon class="menu-icon" @click="drawer = !drawer">
      <v-icon>mdi-menu</v-icon>
    </v-btn>

    <v-snackbar :value="true" timeout="-1">
      <v-container>
        <v-row align="center">
          <v-col multiple align="center" cols="7">
            <v-file-input :accept="accepts" @change="upload" label="File" />
          </v-col>
          <v-col align="center">
            <v-btn-toggle>
              <v-btn
                color="primary"
                @click="slice()"
                :disabled="file.byteLength == 0 || this.viewer.extension == 'gcode'"
                >Slice</v-btn
              >
              <v-btn
                color="secondary"
                @click="download()"
                :disabled="
                  file.byteLength == 0 || this.viewer.extension != 'gcode'
                "
                >Download</v-btn
              >
            </v-btn-toggle>
          </v-col>
        </v-row>
      </v-container>
    </v-snackbar>

    <three-d-viewer
      @done="viewerDone"
      @progress="viewerProgress"
      :extension="viewer.extension"
      data-e2e="three-d-viewer"
      :file="file"
      :plane="viewer.plane"
      :position="viewer.position"
      :rotation="viewer.rotation"
      :scale="viewer.scale"
      :theme="viewer.theme"
      :transfer="false"
      class="emulate-root"
    />
  </v-app>
</template>

<script>
//Imports
import colorPicker from "./components/color-picker";
import slider from "./components/slider.vue";
import { FileFormats } from "unified-3d-loader";
import CuraWASM from "cura-wasm";

//Compute accepted extensions and mime types
const accepts =
  Object.values(FileFormats)
    .map(
      (format) =>
        format.extensions.map((extension) => "." + extension).join(",") +
        "," +
        format.mimes.join(",")
    )
    .join(",") + ",.gcode";

export default {
  data: () => ({
    accepts,
    drawer: false,
    file: new ArrayBuffer(0),
    progress: {
      value: 0,
      visible: false,
    },
    viewer: {
      plane: {
        X: 10,
        Y: 10,
      },
      extension: "",
      position: {
        X: 0,
        Y: 0,
        Z: 0,
      },
      rotation: {
        X: -90,
        Y: 0,
        Z: 180,
      },
      scale: {
        X: 0.1,
        Y: 0.1,
        Z: 0.1,
      },
      theme: {
        background: "#212121",
        plane: "#FFC107",
        primary: "#00BCD4",
        secondary: "#8BC34A",
      },
    },
  }),
  components: {
    "color-picker": colorPicker,
    slider,
  },
  methods: {
    async download() {
      //Create the download link and download the file
      const blob = new Blob([this.file], {
        type: "text/plain",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "Output.gcode";
      link.click();
      link.remove();
    },
    async slice() {
      //Show the progress bar
      this.progress.value = 0;
      this.progress.visible = true;

      //Instanitiate the slicer
      const slicer = new CuraWASM({
        definition: "fdmprinter",
        //Pass menu configuration options
        overrides: [
          {
            key: "mesh_position_x",
            value: this.viewer.position.X,
          },
          {
            key: "mesh_position_y",
            value: this.viewer.position.Z,
          },
          {
            key: "mesh_position_z",
            value: this.viewer.position.Y,
          },
        ],
        transfer: false
      });

      //Register progress
      slicer.on("progress", (percent) => {
        this.progress.value = percent;
      });

      //Slice
      this.file = await slicer.slice(this.file, this.viewer.extension);

      //Update viewer extension
      this.viewer.extension = "gcode";

      //Destroy
      await slicer.destroy();

      //Update position
      this.viewer.position.X += this.viewer.plane.X / 2;
      this.viewer.position.Z -= this.viewer.plane.Y / 2;

      //Hide progress bar
      this.progress.visible = false;
    },
    viewerDone()
    {
      this.progress.visible = false;
    },
    viewerProgress(progress)
    {
      this.progress.value = progress;
    },
    async upload(file) {
      if (file != null) {
        //Set extension
        this.viewer.extension = file.name.split(".").pop();

        //Get the array buffer (Prevent memory ownership errors by cloning the array buffer)
        this.file = await file.arrayBuffer();

        //Reset and display progress bar
        this.progress.value = 0;
        this.progress.visible = true;
      }
    },
  },
};
</script>

<style>
:root {
  overflow-y: auto;
}

.emulate-root {
  background: var(--foreground);
  display: flex;
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}

.menu-icon {
  left: 5px;
  position: absolute !important;
  top: 5px;
  z-index: 5;
}

.container,
.row {
  padding: 0;
}

.col {
  padding: 2px;
}

.v-list {
  max-height: 80vh;
}

.v-navigation-drawer {
  z-index: 10;
}

.v-snack__wrapper {
  width: 80vw;
  max-width: 700px;
}
</style>