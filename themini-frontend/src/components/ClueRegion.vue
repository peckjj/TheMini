<template>
  <div class="clue-region">
    <div>
      <div class="clue-section-label">Across</div>
      <div
        v-for="clue in acrossCluesSorted"
        :key="'across-' + clue.order"
        class="clue-item"
        :class="{ selected: props.selectedDirection === 'across' && props.selectedIndex === clue.order }"
      >
        <span>{{ clue.order + 1 }}. {{ clue.text }}</span>
      </div>
    </div>
    <hr class="clue-separator" />
    <div>
      <div class="clue-section-label">Down</div>
      <div
        v-for="clue in downCluesSorted"
        :key="'down-' + clue.order"
        class="clue-item"
        :class="{ selected: props.selectedDirection === 'down' && props.selectedIndex === clue.order }"
      >
        <span>{{ clue.order + 1 }}. {{ clue.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import type { IClue } from '../../../Crossword/src/Interfaces/IClue';
import type { TDirection } from '../../../Crossword/src/Types/TDirection';

const props = withDefaults(defineProps<{
  clues: IClue[],
  selectedIndex?: number,
  selectedDirection?: TDirection
}>(), {
  selectedIndex: 0,
  selectedDirection: 'across'
});

const acrossCluesSorted = props.clues
  .filter(clue => clue.direction === 'across')
  .sort((a, b) => a.order - b.order);
const downCluesSorted = props.clues
  .filter(clue => clue.direction === 'down')
  .sort((a, b) => a.order - b.order);
</script>

<style scoped>
.clue-region {
  height: 100%;
  width: 100%;
  border: 2px solid #444;
  border-radius: 12px;
  background: #fff;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  font-family: 'Merriweather', 'Georgia', serif;
}

.clue-section-label {
  font-weight: bold;
  font-size: 1.32rem;
  margin: 12px 0 6px 0;
  color: #444;
  letter-spacing: 1px;
  font-family: inherit;
  text-align: center;
}

.clue-item {
  padding: 4px 8px;
  font-size: 1.18rem;
  color: #222;
  font-family: inherit;
}

.clue-separator {
  border: none;
  border-top: 6px solid #000;
  margin: 18px 32px;
  width: calc(100% - 64px);
  border-radius: 3px;
}

.selected {
  background: #e3e8ff;
  box-shadow: 0 0 0 2px #3b5cff inset;
  border-radius: 6px;
  transition: background 0.2s, box-shadow 0.2s;
}
</style>
