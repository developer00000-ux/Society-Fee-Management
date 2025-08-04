export interface FeeEntry {
  id: string
  block: string
  member_name: string
  flat_number: string
  months: string[]
  fee: number
  total_fee: number
  payment_type: string
  remarks: string
  created_at: string
}

export interface Block {
  id: string
  block_name: string
  description: string | null
  created_at: string
}

export interface Member {
  id: string
  name: string
  phone: string | null
  email: string | null
  created_at: string
}

export interface Flat {
  id: string
  flat_number: string
  block_id: string
  member_id: string | null
  floor_number: number | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      fee_entries: {
        Row: FeeEntry
        Insert: Omit<FeeEntry, 'id' | 'created_at'>
        Update: Partial<Omit<FeeEntry, 'id' | 'created_at'>>
      }
      blocks: {
        Row: Block
        Insert: Omit<Block, 'id' | 'created_at'>
        Update: Partial<Omit<Block, 'id' | 'created_at'>>
      }
      members: {
        Row: Member
        Insert: Omit<Member, 'id' | 'created_at'>
        Update: Partial<Omit<Member, 'id' | 'created_at'>>
      }
      flats: {
        Row: Flat
        Insert: Omit<Flat, 'id' | 'created_at'>
        Update: Partial<Omit<Flat, 'id' | 'created_at'>>
      }
    }
  }
} 