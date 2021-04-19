export interface IMaterial<T> {
    reset: (style: T) => void;
    destroy: () => void;
}
