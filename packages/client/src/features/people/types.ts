export type PersonType = 'jamaah' | 'ustadz' | 'pengurus';

export interface Person 
{
    id: number;
    name: string;
    type: PersonType;
    phoneNumber?: string | null;
    address?: string | null;
    status: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePersonDTO extends Omit<Person, 'id' | 'createdAt' | 'updatedAt' | 'status'> 
{
    status?: boolean;
}

export interface UpdatePersonDTO extends Partial<Person> 
{
    id: number;
}

export interface PeopleFormModalProps 
{
    isOpen: boolean;
    onClose: () => void;
    editingPerson: Person | null;
}

export interface UsePeopleParams 
{
    type?: PersonType | 'all';
    status?: 'active' | 'inactive' | 'all';
    search?: string;
}