---
id: compilation
title: Compilation
---


`Nools` can also be used in the browser. The only difference is that you cannot pass a file location to the compile method instead you must provide the source.

Nools is compatible with amd(requirejs) and can also be used in a standard script tag.

## Browser Example

In this example we compile rules definitions inlined in a script tag.

```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/nools-ts"></script>
<script type="text/nools" id="simple">
define Message {
    message : "",
    constructor : function (message) {
        this.text = message;
    }
}

rule Hello {
    when {
        m : Message m.text =~ /^hello\sworld$/
    }
    then {
        modify(m, function(){
            this.text += " goodbye";
        });
    }
}

rule Goodbye {
    when {
        m : Message m.text =~ /.*goodbye$/
    }
    then {
        document.getElementById("output").innerHTML += m.text + "</br>";
    }
}
</script>
<script type="text/javascript">
    function init() {
       //get the source
       var source = document.getElementById("simple").innerHTML;
       //compile the source. The name option is required if compiling directly.
       var flow = nools.compile(source, {name: "simple"}),
                Message = flow.getDefined("message"),
                session = flow.getSession();
        //assert your different messages
        session.assert(new Message("goodbye"));
        session.assert(new Message("hello world"));
        session.match();
    }
</script>
```

## Using a compiled dsl.

You may also use the `nools` executable to compile source into a browser friendly format skipping the need for compiling each time.

```
nools compile ./my/rules.nools > ./compiled.js
```

To use the flow require the compile version either through a script tag, `amd/requirejs`, or `commonjs` require.

If you import the flow using a script tag you can get a reference to the flow by using `nools.getFlow`.

```
nools.getFlow("rules");
```

You may also specify the name of the flow when compiling, it defaults to the name of the nools file less ".nools"

```
nools compile -n "my rules" ./my/rules.nools
```

```
nools.getFlow("my rules");
```

If you are using requirejs or nools must be required using something other than `require("nools")` then you can specify a location of the nools source.

```
nools compile -nl "./location/to/nools" ./my/rules.nools
```

### RequireJS examples

Examples of using nools with require js are located in the [examples directory](./examples).

