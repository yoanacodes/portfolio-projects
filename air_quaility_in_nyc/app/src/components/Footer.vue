<style lang="sass">
    a
        color: #222 !important
    a:active
        color: #222 !important
    a:visited
        color: #222 !important
    a:link
        color: #222 !important
    a:hover
        color: steelblue !important
        transition: 0.3s

</style>

<template>
    <v-footer
        padless
        style="background: #ddd"
    >
        <v-col
        cols="6"
        class="text-left"
        style="font-size: 8pt; color: #333"
        >
           MS Data Visualization, Parsons School of Design, NYC
        </v-col>

        <v-col
        cols="6"
        class="text-right"
        style="font-size: 9pt"
        >
            <a href="http://yoanacodes.github.io/index.html" target="_blank">Portfolio</a> &nbsp;&nbsp;|&nbsp;&nbsp;
            <a href="mailto:yoana.kosturska@gmail.com">Contact: Yoana Kosturska</a> &nbsp;&nbsp;|&nbsp;&nbsp;
            &copy; 2021-{{ new Date().getFullYear() }}
        </v-col>
    </v-footer>

</template>

<script>

export default {
     name: 'Footer'
}

</script>
