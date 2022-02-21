<style lang="sass">
#viz
	background: #ddd
	padding: 50px 0 0 0
</style>

<template>
	<v-container fluid id="viz" min-height="80vh">
		<v-row justify="center" align="center" class="text-center">
			<Map />
		</v-row>
	</v-container>
</template>

<script>
	import Map from './Map.vue';

	export default {
		name: 'Visualizations',
		components: {
			Map
		}
	}
</script>
