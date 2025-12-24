              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((resource) => {
                const locked = isResourceLocked(resource);
                return (
                  <Card
                    key={resource.id}
                    className={`p-6 border-border flex flex-col ${
                      locked ? "opacity-75" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold flex-1 pr-2">
                        {resource.title}
                      </h3>
                      {locked && (
                        <Badge className="bg-accent/20 text-accent border border-accent/50 flex-shrink-0">
                          <Lock className="h-3 w-3 mr-1" />
                          LOCKED
                        </Badge>
                      )}
                      {resource.featured && !locked && (
                        <Badge className="bg-accent text-accent-foreground flex-shrink-0">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed text-muted-foreground mb-4 flex-1">
                      {resource.description}
                    </p>

                    {locked && (
                      <p className="text-xs leading-relaxed text-muted-foreground mb-4 bg-accent/10 p-2 rounded border border-accent/20">
                        Included in Pro ($24.99/mo)
                      </p>
                    )}

                    <div className="flex gap-2">
                      {locked ? (
                        <Button
                          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => handleDownload(resource)}
                        >
                          {isAuthenticated ? "Upgrade to Pro" : "Sign In"}
                        </Button>
                      ) : (
                        <Button
                          className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
                          onClick={() => handleDownload(resource)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 border-border text-center">
              <p className="text-muted-foreground mb-4">
                No resources found in this category
              </p>
              <Button
                variant="outline"
                onClick={() => setSelectedCategory(null)}
              >
                View All Resources
              </Button>