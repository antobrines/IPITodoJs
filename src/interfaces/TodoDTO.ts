export interface TodoDTO {
	_id: string,
	name: string,
	__v: number,
	state: 'DONE' | 'PENDING'
}