<style lang="sass">
#modal
  h3
    text-transform: uppercase
    span
      text-transform: lowercase

  .v-card__subtitle
    .meta-data
      float: left
      span
        display: block
  .v-btn
    min-width: 0
  a
    text-decoration: none

  .hideSensitiveImage
    filter: blur(50px)
    -webkit-filter: blur(50px)
    filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='50')
  .hideSensitiveDescription
    filter: blur(8px)
    -webkit-filter: blur(8px)
    filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='8')

.v-carousel__controls__item.v-btn.v-btn--icon.v-btn--round.theme--dark.v-size--small
  height: 16px !important
  width: 16px !important

.v-carousel__controls__item
  .v-btn__content
    .v-icon.notranslate.mdi.mdi-circle.theme--dark
      font-size: 10px !important

.v-carousel__controls__item
  margin: 3px !important
</style>

<template>
  <v-row justify="center">
    <v-dialog v-model="dialog" scrollable max-width="1000px">
      <v-card id="modal">
        <v-card-title>
          <h3>
            {{ data.data.length }} Artifacts for {{ data.label }} in the
            {{ data.year }}<span>s</span>
          </h3>

          <v-spacer></v-spacer>

          <v-card-actions>
            <v-btn
              color="grey darken-1"
              text
              small
              outlined
              @click="closeDialog"
            >
              <v-icon small color="grey darken-1">mdi-close</v-icon>
              Close
            </v-btn>
          </v-card-actions>
        </v-card-title>

        <v-divider></v-divider>

        <v-card class="justify-center ma-0 pa-0" v-if="hasSensitiveContent">
          <v-card-actions class="justify-center pa-0">
            <v-checkbox
              class=""
              v-model="checkbox"
              label="Show Sensitive (Blurred) Content"
            ></v-checkbox>
            <v-tooltip right color="black" max-width="300">
              <template v-slot:activator="{ on, attrs }">
                <v-icon
                  style="margin-top: -12px"
                  class="ml-1"
                  color="grey"
                  dark
                  small
                  v-bind="attrs"
                  v-on="on"
                >
                  mdi-comment-question-outline
                </v-icon>
              </template>
              <div>
                Blurs out sensitive words and images. Every effort has been made
                to arrive at a complete list of sensitive words, however given
                the dynamic content of the project, some content may have been
                missed. Please, contact me if you notice anything that requires
                a trigger warning.
              </div>
            </v-tooltip>
          </v-card-actions>
        </v-card>

        <v-divider></v-divider>

        <v-card-text style="min-height: 400px">
          <v-container fluid>
            <v-row dense>
              <v-col
                v-for="artifact in data.data"
                :key="artifact.id"
                sm="6"
                xs="12"
                md="6"
              >
                <v-card>
                  <v-carousel
                    height="400"
                    hide-delimiter-background
                    show-arrows-on-hover
                  >
                    <v-carousel-item
                      :class="checkContent(artifact.isSensitive, 'Image')"
                      v-for="(slide, i) in artifact.media"
                      :key="i"
                      :src="`assets/images/screen_${slide}.jpeg`"
                      contain
                      max-height="400"
                      gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.2)"
                      class="white--text align-end"
                    >

                    </v-carousel-item>

                  </v-carousel>

                  <div
                    :class="checkContent(artifact.isSensitive, 'Description')"
                  >
                    <v-card-title>
                      {{ artifact.title }}
                    </v-card-title>

                    <v-card-subtitle>
                      <div class="meta-data">
                        <span>
                          On Exhibit: {{ artifact.isExhibited | onExhibit }}
                        </span>
                        <span> In Museum: {{ artifact.unitCode }} </span>
                      </div>

                      <v-card-actions class="pa-0 mt-4 mb-5">
                        <v-spacer></v-spacer>
                        <a :href="artifact.record_link" target="_blank">
                          <v-btn color="grey darken-3" text small outlined>
                            <v-icon small color="grey darken-3" class="pr-1"
                              >mdi-bank</v-icon
                            >
                            Visit
                          </v-btn>
                        </a>
                      </v-card-actions>
                    </v-card-subtitle>

                    <v-card-text v-text="artifact.description[0]">
                    </v-card-text>
                  </div>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  name: "modal",
  props: {
    data: Object,
  },
  computed: {
    hasSensitiveContent: function() {
      return this.data.data.filter(d => d.isSensitive === true).length ? true : false;
    }
  },
  data() {
    return {
      checkbox: false,
      dialog: true,
    };
  },
  watch: {
    data: {
      handler(val) {
        console.log(val);
        this.dialog = true;
      },
      deep: true,
    },
  },
  filters: {
    onExhibit(isTrue) {
      return isTrue ? "Yes" : "No";
    },
  },
  methods: {
    checkContent(isSensitive, contentType) {
      if (this.checkbox) {
        return "showSensitive";
      } else {
        if (isSensitive) {
          return `hideSensitive${contentType}`;
        }
      }
    },
    closeDialog() {
      this.dialog = false;
      this.$emit("closeDialog");
    },
  },
};
</script>