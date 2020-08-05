<template>
  <v-container class="fill-height">
    <v-row>
      <v-col class="text-center">
        <div class="display-4 font-weight-bold grey--text text--darken-1">
          <v-row no-gutters justify="center">
            <v-spacer></v-spacer>
            <v-col cols="auto" align-self="center">
              <div style="width:0.5em;">4</div>
            </v-col>
            <v-col cols="auto" align-self="center" class="pl-3">
              <v-img class="d-inline-block" width="80" src="/images/imgs/wow.gif" alt />
            </v-col>
            <v-col cols="auto" align-self="center">
              <div style="width:0.5em;">4</div>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
        </div>
        <div class="py-3 headline font-weight-black grey--text text--darken-1">Trang không tồn tại</div>
        <v-btn text @click="$router.back()">Trở lại</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {

}
</script>

<style>
</style>