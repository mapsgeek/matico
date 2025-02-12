import {MapPaneEditor} from './Panes/MapPaneEditor'
import {PageEditor} from './Panes/PageEditor'
import {ScatterplotPaneEditor} from './Panes/ScatterPlotPaneEditor'
import {HistogramPaneEditor} from './Panes/HistogramPaneEditor'
import {PieChartPaneEditor} from './Panes/PieChartPaneEditor'
import {SectionEditor} from './Panes/SectionEditor'
import {TextPaneEditor} from './Panes/TextPaneEditor'
import {LayerEditor} from './Panes/LayerEditor'
import {ControlsPaneEditor} from './Panes/ControlsEditor'


export const Editors ={
  Page: PageEditor,
  Section: SectionEditor,
  Scatterplot: ScatterplotPaneEditor,
  Map: MapPaneEditor ,
  Text: TextPaneEditor,
  Histogram: HistogramPaneEditor,
  PieChart: PieChartPaneEditor,
  Layer: LayerEditor,
  Controls:ControlsPaneEditor
}
