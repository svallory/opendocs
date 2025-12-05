module github.com/svallory/opendocs/apps/opendocs-extractor-go

go 1.21

replace github.com/svallory/opendocs/libs/opendocs-model-go => ../../libs/opendocs-model-go

require (
	github.com/spf13/cobra v1.8.0
	github.com/svallory/opendocs/libs/opendocs-model-go v0.0.0
	golang.org/x/tools v0.16.0
)

require (
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	golang.org/x/mod v0.14.0 // indirect
	golang.org/x/sys v0.15.0 // indirect
)
