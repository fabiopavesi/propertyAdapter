# Property adapter

This is a very simple harmoniser for Observable Property definitions.
It retrieves definitions from an URL and, in case the specific format is known, it will extract the label (more fields will be implemented in the future), and attaches the original document (in the original format).

As of now, the formats available are:
* OGC (http://defs.opengis.net/sissvoc/ogc-def/resource.html?uri=http://www.opengis.net/def/)
* NERC (http://vocab.nerc.ac.uk)

It is dockerised and a docker-compose file is available.

By default the serice responds on port 3000.

The */capabilities* endpoint lists all available APIs.