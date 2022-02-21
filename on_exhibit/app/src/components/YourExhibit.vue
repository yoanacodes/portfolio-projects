<style lang="sass">
    #exhibit
        min-height: 100vh

    #masonry-wrapper
        width: 100% 
        float: left
        position: absolute
        #masonry-with-columns 
            display: grid
            grid-template-columns: repeat(auto-fill, minmax(110px, 1fr))
            grid-gap: 0px
            grid-auto-rows: minmax(110px, auto)
            grid-auto-flow: dense
            z-index: 0
            padding: 0px
            margin: -11px 0 0 -11px
            line-height: 0 !important
            .crop
                width: 120px
                height: 120px
                overflow: hidden
                // margin: 0
                // padding: 0
                img
                    filter: grayscale(40%)
                    min-width: 120px
                    min-height: 120px
                    // border: 1px solid #fff
                    background: #333
                    color: white
                    display: inline-block
                    object-fit: fill
                    // margin: -45px 0 0 -40px
                    // width: 100%
        
</style>
<template>
    <v-container id="exhibit" fluid>

        <div id="masonry-wrapper">
            <div id='masonry-with-columns'> 
                <template v-for="(image, i) in getRandomExhibit">
                    <div class="crop" :key=i>
                        <img :src='`images/thumb_${image}.jpeg`' alt="random image">
                    </div>
                </template>
            </div>    
        </div>

        <v-row align="center" justify="center" style="z-index: 1; position: relative">
             <h1 class="mt-10 mb-6 text-center elevation-10" style="background: #fff; color: #222; padding: 25px">
                On Exhibit: 
                <span>What's in the Smithsonian?</span>
            </h1>
        </v-row>

        <v-row align="center" justify="center">
            <v-btn x-large color="white" class="elevation-12" style="color: #222; position: absolute; top: 88%; " @click='timeline'>
                <v-icon class="pr-3">mdi-bank</v-icon>
                <span style="color: #0094ff">Explore and Compare the Musuems</span>
            </v-btn>                
        </v-row>


    </v-container>
</template>

<script>
import {mapState, mapGetters} from 'vuex';

    export default {
        name: 'YourExhibit',
        computed: {
            ...mapState(['data']),
            ...mapGetters(['getRandomExhibit'])
        },
        mounted() {
            // console.log(this.getRandomExhibit);
        },
        methods: {
            timeline() {
                this.$emit('timeline');
            }
        }
    }
</script>

