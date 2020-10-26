
export const availableSex = {
    Mężczyzna: 'male',
    Kobieta: 'female',
    Inne: 'other',
    Nie_podano: 'none'
  }
export type Sex = keyof typeof availableSex
export class Preferences {
    constructor(public user: {
        age: number;
        sex: Sex;
    },
    public stranger: {
        sex: Sex;
    }){}
}
