import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { systemFont } from 'valdi_core/src/SystemFont';
import { Label, View } from 'valdi_tsx/src/NativeTemplateElements';

/**
 * @ViewModel
 * @ExportModel
 */
export interface ViewModel {}

/**
 * @Context
 * @ExportModel
 */
export interface ComponentContext {}

/**
 * @Component
 * @ExportModel
 */
export class App extends Component<ViewModel, ComponentContext> {
  onCreate(): void {
    console.log('Hello World onCreate!');
  }

  onRender(): void {
    console.log('Hello World onRender!!!');
    <view style={styles.main}>
      <label style={styles.title} value={`Welcome to Valdi!`} font={systemFont(20)} />
    </view>;
  }
}

const styles = {
  main: new Style<View>({
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  }),

  title: new Style<Label>({
    color: 'black',
  }),
};
