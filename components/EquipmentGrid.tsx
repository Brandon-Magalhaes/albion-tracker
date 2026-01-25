import { Equipment, EquipmentItem } from '@/types/albion';
import ItemIcon from './ItemIcon';

const ItemSlot = ({ item, slot, size }: { item: EquipmentItem | null; slot: string; size: number }) => {
  return (
    <div 
      className="relative rounded bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        minWidth: `${size}px`, 
        minHeight: `${size}px`
      }}
      title={slot}
    >
      <ItemIcon 
        type={item?.Type} 
        quality={item?.Quality} 
        count={item?.Count} 
        alt={slot} 
        size={size} 
      />
    </div>
  );
};

export default function EquipmentGrid({ equipment, size = 64 }: { equipment: Equipment; size?: number }) {
  if (!equipment) return null;

  // Mobile size fallback logic can be handled via CSS/Classes or passed prop, 
  // but since we want specific size control, we might rely on the parent to pass responsive sizes 
  // or use a utility class if we change the structure.
  // However, since we are using inline styles for exact px size, let's keep it simple.
  
  return (
    <div className="grid grid-cols-3 gap-1 w-fit mx-auto lg:mx-0">
      <ItemSlot item={equipment.Bag} slot="Bag" size={size} />
      <ItemSlot item={equipment.Head} slot="Head" size={size} />
      <ItemSlot item={equipment.Cape} slot="Cape" size={size} />
      
      <ItemSlot item={equipment.MainHand} slot="MainHand" size={size} />
      <ItemSlot item={equipment.Armor} slot="Armor" size={size} />
      {/* If OffHand is missing, show MainHand again (for 2H weapons visualization) */}
      <ItemSlot item={equipment.OffHand || equipment.MainHand} slot="OffHand" size={size} />

      <ItemSlot item={equipment.Potion} slot="Potion" size={size} />
      <ItemSlot item={equipment.Shoes} slot="Shoes" size={size} />
      <ItemSlot item={equipment.Food} slot="Food" size={size} />
      
      {/* Mount is separate usually, but let's put it in the grid or below */}
      <div className="col-start-2">
        <ItemSlot item={equipment.Mount} slot="Mount" size={size} />
      </div>
    </div>
  );
}
