<script setup lang="ts">
// ...existing code...
import ClueRegion from './components/ClueRegion.vue'
import CrosswordRegion from './components/CrosswordRegion.vue'
import { CrosswordGeneration } from '../../Crossword/src/Utils/CrosswordGeneration';

let crosswordGame = CrosswordGeneration.SampleCrossword();

import { ref } from 'vue';
import type { TDirection } from '../../Crossword/src/Types/TDirection';

const selectedCell = ref<{ row: number, col: number } | null>(null);
const selectedDirection = ref<TDirection | null>(null);

function handleSelectionChange(cell: { row: number, col: number }, direction: TDirection) {
  selectedCell.value = cell;
  selectedDirection.value = direction;
}
</script>

<template>
  <div class="main-bg">
    <div class="regions-container">
      <div class="region region-crossword">
        <CrosswordRegion
          :crosswordGame="crosswordGame"
          @selectionChange="handleSelectionChange"
        />
      </div>
      <div class="region region-clues">
        <ClueRegion
          :clues="crosswordGame.getClues()"
          :selectedIndex="selectedDirection == 'across' ? selectedCell?.row : selectedCell?.col"
          :selectedDirection="selectedDirection ?? undefined"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-bg {
  min-height: 100vh;
  min-width: 100vw;
  height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #232526 0%, #414345 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.regions-container {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  width: 95vw;
  height: 95vh;
}

.region {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.region-crossword {
  flex: 2;
}
.region-clues {
  flex: 1;
}
</style>
