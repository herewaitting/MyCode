import { InstanceContainer } from "../instanceContainer";

export class BillboardCollection extends InstanceContainer {
    public type: string = "billboard";
    constructor() {
        super("billboard");
    }
}
