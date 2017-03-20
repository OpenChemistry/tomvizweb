title: Overview
---

Tomviz Web Viewer let you embed tomviz web export dataset into existing web site and web pages.

To achieve that you can do it programatically or in a declarative manner.

## Declaratively

First you will need to import the JavaScript library which could be done by adding the following script entry.

```
<script type="text/javascript" src="https://unpkg.com/tomvizweb"></script>
```

Then you need to position a `<div>` into your web content with the following informations.

```
<div
  class="tomviz-data-viewer"
  data-url="./url/to/data.tomviz"
  data-viewport="600x500"
/>
```

Look for an actual export to see what the viewer could actually look like based on the data visualized.

Additional arguments can be provided to remove control UI, disable mouse interaction, create animation...

## Removing control UI

In order to remove the control UI, you can do so by adding `data-no-ui` attribute.

## Removing mouse control

In order to remove the control via mouse interaction, you can do so by adding `data-no-mouse` attribute.

## Initial state definition

Addition information can be provided to chose the exact camera angle and/or parameter setting.
To achieve that you will have to provide a `data-initialization` attribute like the following example:

```
<div [...]
  data-initialization="theta=10"
/>
```

## Adding animation

An animation can be achieved by changing several parameter at the same time but not the same time step.
Below is an example that will make the data spin changing `phi` and while also changing the `contour` value but using a different pace. The unit is actually in milliseconds.

```
<div
  class="tomviz-data-viewer"
  data-url="./url/to/data.tomviz"
  data-viewport="600x500"

  data-no-ui
  data-no-mouse

  data-initialization="theta=10&contours=50"
  data-animation="phi=35&contours=1000"
/>
```

## Step information

For local rendering and rotation animation, you may want to provide what is the amount you want to change a given parameter.
To do so, just provide the step information for those parameters with the attribute `data-step="azimuth=2&dolly=5"`


## Toggle interaction mode

When a viewer is used with `data-no-ui`, `data-no-mouse` and `data-animation`, you may feel helpless if you want to use the actual control panel to tune some parameter or the view. To do so, you will just need to __double click__ on the view to toggle the current mode you are in. This will stop the animation and you will gain back the mouse interaction.
