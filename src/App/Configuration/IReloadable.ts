/** Every component that can be reloaded by loading/reloading a new config file should implement this interface
 *  to handle how component reloading is carried out
*/
export default interface Reloadable {
    onConfReload(): void
}