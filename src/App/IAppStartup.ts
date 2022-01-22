export default interface IAppStartup {
    initialize(): boolean
    getModuleName(): string
}