export interface EquipmentItem {
  Type: string;
  Count: number;
  Quality: number;
}

export interface Equipment {
  MainHand: EquipmentItem | null;
  OffHand: EquipmentItem | null;
  Head: EquipmentItem | null;
  Armor: EquipmentItem | null;
  Shoes: EquipmentItem | null;
  Bag: EquipmentItem | null;
  Cape: EquipmentItem | null;
  Mount: EquipmentItem | null;
  Potion: EquipmentItem | null;
  Food: EquipmentItem | null;
}

export interface Player {
  Id: string;
  Name: string;
  GuildName: string;
  GuildId: string;
  AllianceName: string;
  AllianceId: string;
  AllianceTag: string;
  Avatar: string;
  AvatarRing: string;
  DeathFame: number;
  KillFame: number;
  FameRatio: number;
  AverageItemPower: number;
  Equipment: Equipment;
}

export interface Event {
  EventId: number;
  TimeStamp: string;
  Killer: Player;
  Victim: Player;
  TotalVictimKillFame: number;
  Location?: string; // Sometimes available
  Participants: {
    Id: string;
    Name: string;
    GuildName: string;
    DamageDone: number;
    SupportHealingDone: number;
  }[];
  GroupMembers: {
    Id: string;
    Name: string;
    GuildName: string;
  }[];
  GvGMatch?: {
    MatchId: string;
  };
  BattleId: number;
  KillArea: string;
}

export interface SearchResult {
  players: {
    Id: string;
    Name: string;
    GuildName: string;
    GuildId?: string;
    AllianceName: string;
    AllianceId?: string;
  }[];
  guilds: {
    Id: string;
    Name: string;
    AllianceName: string;
    AllianceId: string;
    AllianceTag: string;
    FoundingDate: string;
    FoundingPlayerId: string;
    KillFame: number;
    DeathFame: number;
  }[];
}
