# node-red-contrib-R-nodes

A set of nodes which allows you to use the statistical computing language R in
node RED.

## Installation

Execute `npm install @innetmonitoring/node-red-contrib-r-nodes` inside your
Node RED root directory.

## Setup your R-Server

Install R on the computer you'd like to use as the R server. It can be
downloaded on the [R Project Website](https://www.r-project.org/).

After installation of R install all requirements/libraries required for the
remote code execution. Start R and execute the following commands:

```R
install.packages('RJSONIO')
install.packages('Rserve')
```

## Start your R-Server

Start the R interpreter and run the following commands to start `Rserve`.

```R
library(Rserve)
Rserve()
```

## Available Nodes

### R Server

This is a configuration node to set up a connection to a host running R and
RServe.

### R Script

The R Script node provides the possibility to write R code directly
in node RED. When the node receives a `msg` it is copied to the R server and
your script is executed afterwards. You can manipulate the `msg` object
with default R code. After the code is successfully executed, the `msg` object
is copied back to node red and emitted at the nodes output.

#### Sample R code

Here is some sample code on how to access the `msg` object in R:

```R
data <- msg$payload$data;
msg$payload$mean <- mean(data);
msg$payload$median <- median(data);
```

__Caution:__  
The variable type is not converted by this node. You have to make sure, the
data types of the members you want to access or manipulate are represented by
the correct datatype (e.g. array of floats).
