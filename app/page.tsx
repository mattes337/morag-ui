'use client';

import React from 'react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Label,
  Separator,
  Progress,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight gradient-text">
            MoRAG UI Component Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A comprehensive collection of accessible, production-ready React components built with Radix UI and Tailwind CSS.
          </p>
        </div>

        <Separator />

        {/* Components Demo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Buttons Card */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
              <CardDescription>Various button variants and states</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button loading>Loading...</Button>
              </div>
            </CardContent>
          </Card>

          {/* Form Components Card */}
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields and form controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" required>Email Address</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="user@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="Enter your password"
                  error="Password must be at least 8 characters"
                />
              </div>
            </CardContent>
          </Card>

          {/* Progress & Avatar Card */}
          <Card>
            <CardHeader>
              <CardTitle>Progress & Avatars</CardTitle>
              <CardDescription>Progress indicators and user avatars</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Progress value={75} showValue label="Upload Progress" />
                <Progress value={45} variant="success" />
                <Progress value={25} variant="warning" size="sm" />
              </div>
              <div className="flex items-center space-x-4">
                <Avatar size="sm">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Avatar" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Avatar size="lg">
                  <AvatarFallback>MR</AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>

          {/* MoRAG Features Card */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>MoRAG Platform Features</CardTitle>
              <CardDescription>Enterprise-grade document processing capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="font-medium">Vector Databases</div>
                  <div className="text-muted-foreground">Qdrant, Pinecone, Weaviate</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Document Types</div>
                  <div className="text-muted-foreground">PDF, Audio, Video, Web</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Processing Stages</div>
                  <div className="text-muted-foreground">5 Pipeline Stages</div>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">AI Models</div>
                  <div className="text-muted-foreground">OpenAI, Google, Custom</div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="default">
                Get Started with MoRAG
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <Separator />
        <div className="text-center text-sm text-muted-foreground">
          <p>Built with Next.js 14, React 18, Radix UI, and Tailwind CSS</p>
          <p className="mt-1">Designed for enterprise-grade applications</p>
        </div>
      </div>
    </div>
  );
}