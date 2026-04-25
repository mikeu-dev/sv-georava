import type Map from 'ol/Map.js';
import { Select, Modify, DragAndDrop, Draw } from 'ol/interaction.js';
import type { Options as DrawOptions } from 'ol/interaction/Draw.js';
import type { Options as SelectOptions } from 'ol/interaction/Select.js';
import type { Options as ModifyOptions } from 'ol/interaction/Modify.js';
import type { Options as DragAndDropOptions } from 'ol/interaction/DragAndDrop.js';

export function addSelectInteraction(map: Map, options?: SelectOptions) {
  const select = new Select(options);
  map.addInteraction(select);
  return select;
}

export function addModifyInteraction(map: Map, options: ModifyOptions) {
  const modify = new Modify(options);
  map.addInteraction(modify);
  return modify;
}

export function addDrawInteraction(map: Map, options: DrawOptions) {
  const draw = new Draw(options);
  map.addInteraction(draw);
  return draw;
}

export function addDragAndDropInteraction(map: Map, options: DragAndDropOptions) {
  const dragAndDrop = new DragAndDrop(options);
  map.addInteraction(dragAndDrop);
  return dragAndDrop;
}
