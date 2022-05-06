<style lang="sass">
    a
        color: #fff !important
    a:active
        color: #fff !important
    a:visited
        color: #fff !important
    a:link
        color: #fff !important
    a:hover
        color: steelblue !important
        transition: 0.3s

</style>

<template>

    <v-footer
        padless
        dark
    >
        <v-col
        cols="6"
        class="text-left"
        style="font-size: 9pt"
        >
           MS Data Visualization, Parsons School of Design, NYC
        </v-col>
        <v-col
        cols="6"
        class="text-right"
        style="font-size: 9pt"
        >
            <a href="https://yoanacodes.com" target="_blank">Portfolio</a> &nbsp;&nbsp;|&nbsp;&nbsp;
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
