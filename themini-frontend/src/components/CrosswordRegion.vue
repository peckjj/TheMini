<template>
  <div class="crossword-region">
    <div
      class="crossword-grid"
      :style="{
        gridTemplateRows: `repeat(${crosswordGame.rows}, 1fr)`,
        gridTemplateColumns: `repeat(${crosswordGame.cols}, 1fr)`
      }"
    >
      <template v-for="row in crosswordGame.rows">
        <template v-for="col in crosswordGame.cols" :key="`${row}-${col}`">
          <div
            class="crossword-cell"
            :style="{
              background: crosswordGame.intersectsWord(row - 1, col - 1) ? '#fff' : '#000'
            }"
          ></div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ICrosswordGame } from '../../../Crossword/src/Interfaces/ICrosswordGame';

defineProps<{ crosswordGame: ICrosswordGame }>();
</script>

<style scoped>
.crossword-region {
  height: 100%;
  width: 100%;
  border: 2px solid #444;
  border-radius: 12px;
  background: rgba(40, 40, 50, 0.7);
  box-sizing: border-box;
}

.crossword-grid {
  display: grid;
  height: 100%;
  width: 100%;
  gap: 2px;
}

.crossword-cell {
  border: 1px solid #555;
  border-radius: 4px;
  width: 100%;
  height: 100%;
  transition: background 0.2s;
}
</style>
