export type HashMap<T> = {
	[prop: string]: T;
}

export type VirtualNodeTagType = 'TAG' | 'TEXT' | 'COMMENT';

export type VirtualNodeType = {
	isVNode: boolean;
	type: VirtualNodeTagType;
	name?: string;
	void?: boolean;
	attrs?: HashMap<string>;
	content?: string;
	children: Array<VirtualNodeType>;
	props?: any;
	route: Array<number>;
};


