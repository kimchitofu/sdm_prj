"use client"

import { useState } from "react"
import { 
  PlusCircle,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Folders,
  FileText,
  Palette
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardLayout } from "@/components/layout/dashboard-sidebar"
import { StatsCard } from "@/components/ui/stats-card"
import { categories, campaigns } from "@/lib/mock-data"
import { Category } from "@/lib/types"

const platformUser = {
  displayName: 'Platform Manager',
  email: 'manager@fundbridge.org',
  role: 'platform_manager'
}

const colorOptions = [
  { name: 'Azure Blue', value: '#B2C2DE' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Pink', value: '#ec4899' },
]

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryList, setCategoryList] = useState(categories)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState({ name: '', description: '', color: '#B2C2DE', icon: 'heart' })
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const getCampaignCount = (categoryName: string) => {
    return campaigns.filter(c => c.category === categoryName).length
  }

  const filteredCategories = categoryList.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeCategories = categoryList.filter(c => c.isActive).length
  const inactiveCategories = categoryList.filter(c => !c.isActive).length
  const totalUsage = categoryList.reduce((sum, c) => sum + getCampaignCount(c.name), 0)

  const handleCreateCategory = () => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategory.name,
      description: newCategory.description,
      icon: newCategory.icon,
      color: newCategory.color,
      campaignCount: 0,
      isActive: true,
      createdAt: new Date().toISOString()
    }
    setCategoryList([...categoryList, newCat])
    setNewCategory({ name: '', description: '', color: '#B2C2DE', icon: 'heart' })
    setShowCreateDialog(false)
  }

  const handleEditCategory = () => {
    if (!editingCategory) return
    setCategoryList(categoryList.map(c => c.id === editingCategory.id ? editingCategory : c))
    setEditingCategory(null)
    setShowEditDialog(false)
  }

  const handleToggleStatus = (category: Category) => {
    setCategoryList(categoryList.map(c =>
      c.id === category.id ? { ...c, isActive: !c.isActive } : c
    ))
  }

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return
    setCategoryList(categoryList.filter(c => c.id !== categoryToDelete.id))
    setCategoryToDelete(null)
    setDeleteDialogOpen(false)
  }

  return (
    <DashboardLayout 
      role="platform_management"
      user={{
          name: platformUser.displayName,
          email: platformUser.email,
          role: platformUser.role
        }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Category Management
          </h1>
          <p className="text-muted-foreground">
            Manage fundraising categories for the platform.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>Add a new fundraising category to the platform.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g., Healthcare"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Brief description of this category"
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newCategory.color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateCategory} disabled={!newCategory.name}>Create Category</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Categories"
          value={categoryList.length.toString()}
          icon={<Folders className="h-5 w-5" />}
          description="All categories"
        />
        <StatsCard
          title="Active"
          value={activeCategories.toString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="Currently active"
        />
        <StatsCard
          title="Inactive"
          value={inactiveCategories.toString()}
          icon={<XCircle className="h-5 w-5" />}
          description="Deactivated"
        />
        <StatsCard
          title="Total Usage"
          value={totalUsage.toString()}
          icon={<FileText className="h-5 w-5" />}
          description="Campaigns using"
        />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Campaigns</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCategories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20` }}
                      >
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {category.description}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">{getCampaignCount(category.name)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? 'default' : 'secondary'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(category.createdAt).toLocaleDateString('en-AU')}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditingCategory(category); setShowEditDialog(true) }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(category)}>
                          {category.isActive ? (
                            <>
                              <XCircle className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => { setCategoryToDelete(category); setDeleteDialogOpen(true) }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details.</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingCategory.description}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setEditingCategory({ ...editingCategory, color: color.value })}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        editingCategory.color === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
            <Button onClick={handleEditCategory}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the &ldquo;{categoryToDelete?.name}&rdquo; category. 
              Campaigns using this category will need to be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
