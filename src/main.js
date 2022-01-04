import Vue from 'vue';
import App from './App.vue';
import Viewer from 'vue-3d-viewer';
import Vuetify from 'vuetify';
import { colors } from 'vuetify/lib';
import 'vuetify/dist/vuetify.css';
import '@mdi/font/css/materialdesignicons.css';

//Vue pluigins
Vue.use(Viewer);
Vue.use(Vuetify);

new Vue({
  render: h => h(App),
  vuetify: new Vuetify({
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.cyan.base,
          secondary: colors.lightGreen.base,
          accent: colors.amber.base
        }
      }
    }
  })
}).$mount("#app");
