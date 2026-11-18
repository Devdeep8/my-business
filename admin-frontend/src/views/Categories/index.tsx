"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconLoader, IconPlus, IconRefresh } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ApiError } from "@/services/api.service";
import { categoriesService, type Category } from "@/services/categories.service";
import { CategoryFormDialog } from "@/views/Categories/components/CategoryFormDialog";

type CategoryRow = {
  category: Category;
  depth: number;
};

function flattenCategories(categories: Category[]): CategoryRow[] {
  const childrenByParent = new Map<string | null, Category[]>();
  for (const category of categories) {
    const parentId = category.parentId ?? null;
    const children = childrenByParent.get(parentId) ?? [];
    children.push(category);
    childrenByParent.set(parentId, children);
  }
  for (const children of childrenByParent.values()) {
    children.sort((a, b) => a.displayOrder - b.displayOrder || a.name_en.localeCompare(b.name_en));
  }

  const rows: CategoryRow[] = [];
  const visited = new Set<string>();
  const appendChildren = (parentId: string | null, depth: number) => {
    for (const category of childrenByParent.get(parentId) ?? []) {
      if (visited.has(category.id)) continue;
      visited.add(category.id);
      rows.push({ category, depth });
      appendChildren(category.id, depth + 1);
    }
  };

  appendChildren(null, 0);
  for (const category of categories) {
    if (!visited.has(category.id)) rows.push({ category, depth: 0 });
  }
  return rows;
}

export function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesService.list();
      setCategories(response.items);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let current = true;
    categoriesService.list()
      .then((response) => {
        if (current) setCategories(response.items);
      })
      .catch((err: unknown) => {
        if (current) {
          setError(err instanceof ApiError ? err.message : "Failed to load categories.");
        }
      })
      .finally(() => {
        if (current) setLoading(false);
      });

    return () => {
      current = false;
    };
  }, []);

  const rows = useMemo(() => flattenCategories(categories), [categories]);

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the category tree used by business listings.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus />
          New category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category directory</CardTitle>
          <CardDescription>
            {categories.length} {categories.length === 1 ? "category" : "categories"} configured.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span role="alert">{error}</span>
              <Button variant="outline" size="sm" onClick={() => void refresh()}>
                <IconRefresh />
                Retry
              </Button>
            </div>
          ) : loading ? (
            <div className="flex min-h-32 items-center justify-center text-muted-foreground">
              <IconLoader className="size-5 animate-spin" aria-label="Loading categories" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Business selection</TableHead>
                  <TableHead className="text-right">Order</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No categories yet. Create your first category.
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map(({ category, depth }) => {
                    const parent = categories.find((item) => item.id === category.parentId);
                    return (
                      <TableRow key={category.id}>
                        <TableCell>
                          <div style={{ paddingLeft: depth * 20 }}>
                            <p className="font-medium">{category.name_en}</p>
                            <p className="text-xs text-muted-foreground">{category.name_hi}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{category.slug}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {parent?.name_en ?? "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={category.isActive ? "default" : "secondary"}>
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {category.isLeaf ? "Selectable" : "Not selectable"}
                        </TableCell>
                        <TableCell className="text-right">{category.displayOrder}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CategoryFormDialog
        open={formOpen}
        categories={categories}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false);
          void refresh();
        }}
      />
    </div>
  );
}
