import { Equipment, EquipmentItem } from '@/types/albion';
import ItemIcon from './ItemIcon';

const ItemSlot = ({ item, slot }: { item: EquipmentItem | null; slot: string }) => {
  return (
    <div className="relative h-12 w-12 rounded bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden" title={slot}>
      <ItemIcon 
        type={item?.Type} 
        quality={item?.Quality} 
        count={item?.Count} 
        alt={slot} 
        size={48} 
      />
    </div>
  );
};

export default function EquipmentGrid({ equipment }: { equipment: Equipment }) {
  if (!equipment) return null;

  return (
    <div className="grid grid-cols-3 gap-1 w-fit mx-auto lg:mx-0">
      <ItemSlot item={equipment.Head} slot="Head" />
      <ItemSlot item={equipment.Cape} slot="Cape" />
      <ItemSlot item={equipment.Bag} slot="Bag" />
      
      <ItemSlot item={equipment.MainHand} slot="MainHand" />
      <ItemSlot item={equipment.Armor} slot="Armor" />
      <ItemSlot item={equipment.OffHand} slot="OffHand" />

      <ItemSlot item={equipment.Potion} slot="Potion" />
      <ItemSlot item={equipment.Shoes} slot="Shoes" />
      <ItemSlot item={equipment.Food} slot="Food" />
      
      {/* Mount is separate usually, but let's put it in the grid or below */}
      <div className="col-start-2">
        <ItemSlot item={equipment.Mount} slot="Mount" />
      </div>
    </div>
  );
}
